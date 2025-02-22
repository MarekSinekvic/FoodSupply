<?php

namespace App\Controller;

use App\Entity\Food;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class FoodController extends AbstractController
{
    #[Route('/food/show/{id}', name: 'food_show')]
    public function index(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        return new JsonResponse();
    }
    #[Route('/food/list', name: 'app_food')]
    public function list(EntityManagerInterface $entityManager): JsonResponse {
        $foods = $entityManager->getRepository(Food::class)->getAll();
        return new JsonResponse($foods);
    }
}
