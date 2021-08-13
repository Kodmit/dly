<?php

namespace App\Controller;

use App\Action\User\CreateUser;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\HandledStamp;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    private UserRepository $userRepository;
    private MessageBusInterface $commandBus;

    public function __construct(UserRepository $userRepository, MessageBusInterface $commandBus)
    {
        $this->userRepository = $userRepository;
        $this->commandBus = $commandBus;
    }

    /**
     * @Route("/users", methods={"GET"})
     */
    public function getUsers(): JsonResponse
    {
        return $this->json(
            $this->userRepository->findAll(),
            JsonResponse::HTTP_OK,
            [],
            ['groups' => 'user']
        );
    }

    /**
     * @Route("/users", methods={"POST"})
     */
    public function createUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $envelope = $this->commandBus->dispatch(new CreateUser(
            $data['username'],
            $data['password']
        ));

        /** @var HandledStamp $handledStamp */
        $handledStamp = $envelope->last(HandledStamp::class);

        return $this->json(
            $handledStamp->getResult(),
            JsonResponse::HTTP_CREATED,
            [],
            ['groups' => 'user']
        );
    }
}
