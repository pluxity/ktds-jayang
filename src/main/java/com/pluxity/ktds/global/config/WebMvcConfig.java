package com.pluxity.ktds.global.config;

import com.pluxity.ktds.domains.api.parking.AccessTokenInterceptor;
import com.pluxity.ktds.global.constant.ViewPath;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.util.concurrent.TimeUnit;

@Configuration(proxyBeanMethods = false)
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final AccessTokenInterceptor accessTokenInterceptor;

    @Value("${root-path.upload}")
    private String resourcePath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl
                        .maxAge(1, TimeUnit.DAYS)
                        .cachePublic()
                        .immutable())
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
        registry.addResourceHandler("/**")
                .addResourceLocations("file:" + resourcePath)
                .setCacheControl(CacheControl
                        .maxAge(1, TimeUnit.DAYS)
                        .cachePublic()
                        .immutable())
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/static/favicon.ico");

    }

    @Override
    public void addViewControllers(@NotNull ViewControllerRegistry registry) {
        for(ViewPath v : ViewPath.values()) {
            registry.addViewController(v.getPath()).setViewName(v.getView());
        }
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(accessTokenInterceptor)
                .addPathPatterns("/api/v1/park/**");
    }
}
