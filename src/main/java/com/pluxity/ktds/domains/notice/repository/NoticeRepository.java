package com.pluxity.ktds.domains.notice.repository;

import com.pluxity.ktds.domains.notice.entity.Notice;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    List<Notice>  findAllByOrderByExpiredAt();

    @Modifying
    @Query("UPDATE Notice n SET n.isRead = true WHERE n.id IN :ids")
    int markNoticesAsRead(@Param("ids") List<Long> ids);

}
