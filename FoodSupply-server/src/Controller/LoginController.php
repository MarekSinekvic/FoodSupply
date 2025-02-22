<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

class LoginController extends AbstractController
{
    #[Route('/login', name: 'app_login', methods: ['post'])]
    public function index(#[CurrentUser] ?User $user): JsonResponse
    {
        if ($user === null) {
            return $this->json([], Response::HTTP_UNAUTHORIZED);
        }
        $token = 0;
        return $this->json([
            'user' => $user,
            'token' => $token
        ]);
    }
    #[Route('/login/get',name:'user_info',methods:['get','post'])]
    public function get(EntityManagerInterface $entityManager):JsonResponse {
        return $this->json(
            $entityManager->getRepository(User::class)->findOneBy(['email'=>$this->getUser()->getUserIdentifier()])
        );
    }
    #[Route('/logout',name:'logout')]
    public function logout():JsonResponse {
        return new JsonResponse();
    }
    #[Route('/login/list',name:"users_list")]
    public function list(Request $request, EntityManagerInterface $entityManager):JsonResponse {
        $identifier = $request->query->filter('identifier',null);
        if ($identifier)
            return $this->json(
                $entityManager->getRepository(User::class)->findByEvery(['email'=>$identifier, 'id'=>intval($identifier),'roles'=>$identifier])//, 
            );
        else
            return $this->json(
                $entityManager->getRepository(User::class)->findAll()
            );
    }
    #[Route('/login/create',name:"user_create",methods:['get'])]
    public function create(Request $request,EntityManagerInterface $entityManager,UserPasswordHasherInterface $passwordHasher):JsonResponse {
        $user = new User();
        $user->setEmail($request->get('email'));
        $user->setPassword($passwordHasher->hashPassword($user,$request->get('password')));
        $user->setRoles(json_decode($request->get('roles')));

        $entityManager->persist($user);
        $entityManager->flush();
        return $this->json($user);
    }
    #[Route('/login/set/{id}',name:"user_set",methods:['get'])]
    public function set(int $id,Request $request,EntityManagerInterface $entityManager,UserPasswordHasherInterface $passwordHasher):JsonResponse {
        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user) {
            throw $this->createNotFoundException(
                'No user found for id '.$user->getId()
            );
        }

        if ($request->query->has('email'))
            $user->setEmail($request->get('email'));
        if ($request->query->has('password'))
            $user->setPassword($passwordHasher->hashPassword($user,$request->get('password')));
        if ($request->query->has('roles'))
            $user->setRoles(json_decode($request->get('roles')));
        
        $entityManager->flush();

        return $this->json($user);
    }
    #[Route('/login/delete/{id}',name:"user_delete",methods:['get'])]
    public function delete(int $id,EntityManagerInterface $entityManager):JsonResponse {
        $user = $entityManager->getRepository(User::class)->find($id);

        $entityManager->remove($user);
        $entityManager->flush();
        return $this->json($user);
    }
    #[Route('/login/check', name: 'user_check',methods: ['post','get'])]
    public function isLogged():JsonResponse {
        $user = $this->getUser();
        if ($user !== null)
            return $this->json($this->getUser()->getUserIdentifier());
        else return new JsonResponse([],401);
    }
    #[Route('/login/roles',name:'user_roles',methods:['post','get'])]
    public function roles():JsonResponse {
        $user = $this->getUser();
        if ($user !== null)
            return $this->json($this->getUser()->getRoles());
        else return new JsonResponse([],401);
    }
}
