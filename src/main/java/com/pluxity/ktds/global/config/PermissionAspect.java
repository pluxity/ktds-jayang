package com.pluxity.ktds.global.config;

import com.pluxity.ktds.global.annotation.IgnoreBuildingPermission;
import com.pluxity.ktds.global.annotation.IgnorePoiPermission;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionAspect {
    private final EntityManager entityManager;

    @Before("execution(public * com.pluxity.ktds.domains..service..*(..)) && " +
            "(@within(org.springframework.transaction.annotation.Transactional) || " +
            "@annotation(org.springframework.transaction.annotation.Transactional))")
    public void applyBuildingPermissionFilter(JoinPoint jp) throws NoSuchMethodException {

        MethodSignature signature = (MethodSignature) jp.getSignature();
        Method method = signature.getMethod();

        Class<?> targetClass = jp.getTarget().getClass();
        Method targetMethod = targetClass.getMethod(method.getName(), method.getParameterTypes()); // 실제 구현체 메서드

        log.info("method : {}.{}", method.getDeclaringClass().getName(), method.getName());
        log.info("targetMethod : {}.{}", targetMethod.getDeclaringClass().getName(), targetMethod.getName());

        boolean ignoreBuilding = method.isAnnotationPresent(IgnoreBuildingPermission.class)
                || method.getDeclaringClass().isAnnotationPresent(IgnoreBuildingPermission.class);

        boolean ignorePoi = method.isAnnotationPresent(IgnorePoiPermission.class)
                || method.getDeclaringClass().isAnnotationPresent(IgnorePoiPermission.class);

        log.info("ignoreBuilding={}, ignorePoi={}", ignoreBuilding, ignorePoi);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return;

        Session session = entityManager.unwrap(Session.class);

        // 도면 권한
        if (!ignoreBuilding) {
            Set<Long> permittedBuildingIds = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("BUILDING_"))
                    .map(a -> a.substring("BUILDING_".length()))
                    .map(Long::valueOf)
                    .collect(Collectors.toSet());
            log.info("permittedBuildingIds={}", permittedBuildingIds);

            if (!permittedBuildingIds.isEmpty()) {
                session.enableFilter("buildingPermissionFilter")
                        .setParameterList("permittedIds", permittedBuildingIds);
            }
        }

        // 장비 권한
        if (!ignorePoi) {
            Set<Long> permittedCategoryIds = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("POI_"))
                    .map(a -> a.substring("POI_".length()))
                    .map(Long::valueOf)
                    .collect(Collectors.toSet());
            log.info("permittedCategoryIds={}", permittedCategoryIds);

            if (!permittedCategoryIds.isEmpty()) {
                session.enableFilter("poiCategoryPermissionFilter")
                        .setParameterList("permittedCategoryIds", permittedCategoryIds);
            }
        }
    }
}
