import axios from "axios";
const github = {
  isLogged() {
    return (
      null !== localStorage.getItem("github_access_token") &&
      undefined !== localStorage.getItem("github_access_token")
    );
  },
  async refreshToken() {
    const refreshToken = localStorage.getItem("github_refresh_token");
    const clientId = process.env.VUE_APP_CLIENT_ID;
    const clientSecret = process.env.VUE_APP_CLIENT_SECRET;

    const tokenUri = process.env.VUE_APP_TOKEN_URI;
    const response = await axios.post(
      `${tokenUri}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&refresh_token=${refreshToken}`
    );

    const newToken = response.data;
    console.log("new token : ", newToken);
  },
  async getTokenFromCode(code) {
    const response = await axios.post(
      process.env.VUE_APP_BASE_URL + "o-auth/access_token?code=" + code
    );
    console.log("github response : ", response.data);

    const newToken = response.data;

    localStorage.setItem("github_access_token", newToken);
    localStorage.setItem("github_refresh_token", newToken["refresh_token"]);
  },
  async getProjects() {
    // project id = PN_kwDOBLNM584AAfjC
    const org = "Fogo-Capital";
    const response = await axios.get(
      `https://api.github.com/orgs/${org}/projects?per_page=20&page=1`,
      {
        headers: {
          Authorization: localStorage.getItem("github_access_token"),
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    console.log(response.data);
    return response.data;
  },
  createAndConvertIssues(rows) {
    const columns = rows[0];

    rows
      .filter((row) => row[0] == "prêt à l'envoi")
      .map((row) => {
        let rowObject = {};
        columns.forEach((col, index) => {
          rowObject[col] = row[index];
        });
        return rowObject;
      })
      .forEach((issue) => {
        console.log(issue);
        this.createGithubIssue(issue)
      });
  },
  async createGithubIssue(issue) {
    await axios.post(
      `https://api.github.com/repos/Fogo-Capital/maorie-monolith/issues`,
      {
        title: issue.titre,
      },
      {
        headers: {
          Authorization: localStorage.getItem("github_access_token"),
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
  },
};

export default github;