<?php

namespace App\Controller;

use App\Entity\Category;
use App\Entity\Food;
use App\Entity\Order;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Log\Logger;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Encoder\JsonDecode;
use Symfony\Component\Serializer\Normalizer\ArrayDenormalizer;
use Symfony\Component\Serializer\Normalizer\GetSetMethodNormalizer;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class OrderController extends AbstractController
{
    #[Route('/order/show/{id}', name: 'app_order')]
    public function index(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $order = $entityManager->getRepository(Order::class)->createQueryBuilder('q')
            ->where('q.id = :id')->setParameter('id',$id)
            ->leftJoin('q.food','f')->addSelect('f')
            ->getQuery()->getArrayResult();
        return new JsonResponse($order[0]);
    }
    #[Route('/order/list', 'order_list', methods: ['get'])]
    public function list(Request $request, EntityManagerInterface $entityManager,CacheInterface $cache): Response {
        $orders = $cache->get('orders_list',function (ItemInterface $item) use($entityManager):array {
            return $entityManager->getRepository(Order::class)->getAll();
        });

        return new JsonResponse($orders);
    }
    #[Route('/order/new','order_new',methods: ['GET'])]
    public function create(Request $request, EntityManagerInterface $entityManager, SerializerInterface $serializer): JsonResponse {
        $foods = $request->get('foods');
        $customerName = $request->get('customer_name');
        if ($foods === NULL) return new JsonResponse([],400);
        else
            $foodNames = $serializer->deserialize($foods, 'string[]', 'json',[new ArrayDenormalizer()]); //{"name":"cola","id":1}

        $order = new Order();
        $categoryRepo = $entityManager->getRepository(Category::class);
        foreach ($foodNames as $name) {
            $order->addFood($categoryRepo->findOneBy(['name'=>$name]));
        }
        $order->setCustomerName("Vladimir");

        $entityManager->persist($order);
        $entityManager->flush();

        return new JsonResponse($order);
    }
    #[Route('/order/progress/{id}','order_progress',methods:['get'])]
    public function progress(int $id, Request $request, EntityManagerInterface $entityManager, CacheInterface $cache):Response {
        $order = $entityManager->getRepository(Order::class)->find($id);
        $order->setProgress($request->get('value'));
        $entityManager->flush();

        $cache->delete('orders_list');

        return new Response();
    }
}
