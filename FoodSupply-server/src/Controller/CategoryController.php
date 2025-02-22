<?php

namespace App\Controller;

use App\Entity\Category;
use App\Entity\Food;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

class CategoryController extends AbstractController
{
    public EntityManagerInterface $entityManager;
    public function __construct(EntityManagerInterface $entityManager) {
        $this->entityManager = $entityManager;
    }

    #[Route('/category/show/{id}', name: 'show_category')]
    public function index(int $id): JsonResponse
    {
        $category = $this->entityManager->getRepository(Category::class)->find($id);
        return $this->json($category,context: [AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function (object $object, ?string $format, array $context):int {
            return $object->getId();
        }]);
    }
    #[Route('/category/list', name: 'list_category')]
    public function list(): JsonResponse {
        $categories = $this->entityManager->getRepository(Category::class)->findBy(['parent_category'=>null]);
        return $this->json($categories,context: [AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function (object $object, ?string $format, array $context):int {
            return $object->getId();
        }]);
    }
    #[Route('/category/create', name: 'create_category', methods: ['get'])]
    public function create(Request $request): JsonResponse
    {
        $category = new Category();
        
        $category->setName($request->get('name'));
        $parent_id = $request->get('parent_id');
        if ($parent_id !== null) {
            $parent_category = $this->entityManager->getRepository(Category::class)->find($parent_id);
            if ($parent_category !== null)
                $category->setParentCategory($parent_category);
        }
        
        // $category->setImageUri($request->get());

        $this->entityManager->persist($category);
        $this->entityManager->flush();
        return $this->json($category,context: [AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function (object $object, ?string $format, array $context):int {
            return $object->getId();
        }]);
    }
    #[Route('/category/set/{id}', name: 'set_category', methods: ['get'])]
    public function set(int $id, Request $request): JsonResponse {
        $category = $this->entityManager->getRepository(Category::class)->find($id);
        
        if ($request->query->has('name'))
            $category->setName($request->get('name'));
        if ($request->query->has('image'))
            $category->setImageUri($request->get('image'));

        $this->entityManager->flush();
        return $this->json($category,context: [AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function (object $object, ?string $format, array $context):int {
            return $object->getId();
        }]);
    }
    private function parseRelation(string $class, string | null $relation, callable $func):void {
        if ($relation !== null) {
            $repo = $this->entityManager->getRepository($class);
            $relation = json_decode($relation);
            foreach ($relation as $sub) 
                $func($repo->find($sub));
        }
    }
    #[Route('/category/attach/{id}','attach_category',methods:['get'])]
    public function attach(int $id, Request $request):JsonResponse {
        $category = $this->entityManager->getRepository(Category::class)->find($id);
        
        $categories = $request->get('categories');
        $foods = $request->get('foods');

        $this->parseRelation(Category::class, $categories, function (Category $sub)use($category)  {
            $category->addCategory($sub);
        });
        $this->parseRelation(Food::class, $foods, function (Food $sub)use($category)  {
            $sub->setCategory($category);
        });
        $this->entityManager->flush();
        return $this->json($category,context: [AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function (object $object, ?string $format, array $context):int {
            return $object->getId();
        }]);
    }
    #[Route('/category/deattach/{id}','deattach_category',methods:['get'])]
    public function deattach(int $id, Request $request):JsonResponse {
        $categoryRepo = $this->entityManager->getRepository(Category::class);
        $category = $categoryRepo->find($id);
        
        $categories = $request->get('categories');
        $foods = $request->get('foods');
        
        $this->parseRelation(Category::class, $categories, function (Category $sub)use($category)  {
            $category->removeCategory($sub);
        });
        $this->parseRelation(Food::class, $foods, function (Food $sub)use($category)  {
            $sub->setCategory(null);
        });
        $this->entityManager->flush();
        return $this->json($category,context: [AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function (object $object, ?string $format, array $context):int {
            return $object->getId();
        }]);
    }
    #[Route('/category/remove/{id}', name: 'remove_category', methods: ['get'])]
    public function remove(int $id):RedirectResponse {
        $category = $this->entityManager->getRepository(Category::class)->find($id);
        if ($category !== null) {
            $this->entityManager->remove($category);
            $this->entityManager->flush();
        }

        return new RedirectResponse('/');
    }
}
