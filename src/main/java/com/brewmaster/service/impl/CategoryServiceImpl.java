package com.brewmaster.service.impl;

import com.brewmaster.dto.request.CategoryRequest;
import com.brewmaster.dto.response.CategoryResponse;
import com.brewmaster.entity.Category;
import com.brewmaster.exception.CategoryAlreadyExistsException;
import com.brewmaster.exception.CategoryNotFoundException;
import com.brewmaster.mapper.CategoryMapper;
import com.brewmaster.repository.CategoryRepository;
import com.brewmaster.service.interfaces.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {

        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new CategoryAlreadyExistsException(
                    "Category already exists with name: " + request.getName()
            );
        }

        Category category = categoryMapper.toEntity(request);

        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findByDeletedFalse()
                .stream()
                .filter(category -> Boolean.TRUE.equals(category.getActive()))
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(Long categoryId) {

        Category category = categoryRepository.findByIdAndDeletedFalseAndActiveTrue(categoryId)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + categoryId
                        )
                );
        return categoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {

        Category category = categoryRepository.findByIdAndDeletedFalseAndActiveTrue(categoryId)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + categoryId
                        )
                );

        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByNameIgnoreCase(request.getName())) {

            throw new CategoryAlreadyExistsException(
                    "Category already exists with name: " + request.getName()
            );
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updatedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(updatedCategory);
    }

    @Override
    public void deleteCategory(Long categoryId) {

        Category category = categoryRepository.findByIdAndDeletedFalseAndActiveTrue(categoryId)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: " + categoryId
                        )
                );

        category.setActive(false);
        category.setDeleted(true);

        categoryRepository.save(category);
    }
}