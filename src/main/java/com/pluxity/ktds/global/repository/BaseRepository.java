package com.pluxity.ktds.global.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;

@NoRepositoryBean
public interface BaseRepository<T, ID> extends JpaRepository<T, ID> {
    @Override
    default List<T> findAll() {
        return findAll(Sort.by(Sort.Direction.DESC, "id"));
    }
}
