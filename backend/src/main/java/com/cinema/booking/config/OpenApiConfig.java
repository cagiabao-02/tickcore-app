package com.cinema.booking.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Swagger/OpenAPI metadata and HTTP bearer JWT scheme. */
@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI tickCoreOpenApi() {
        String scheme = "bearerAuth";
        return new OpenAPI()
            .info(new Info().title("TickCore Booking API").version("v1")
                .description("API đặt vé rạp chiếu phim TickCore."))
            .components(new Components().addSecuritySchemes(scheme,
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }

    /** Chỉ đánh dấu JWT cho operation được SecurityConfig yêu cầu đăng nhập. */
    @Bean
    OpenApiCustomizer endpointSecurityDocumentation() {
        return openApi -> {
            if (openApi.getPaths() == null) return;
            openApi.getPaths().forEach((path, pathItem) -> pathItem.readOperationsMap().forEach((method, operation) -> {
                if (!isPublic(path, method)) {
                    operation.addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
                }
            }));
        };
    }

    private boolean isPublic(String path, PathItem.HttpMethod method) {
        if (path.startsWith("/api/v1/auth/") && !path.equals("/api/v1/auth/logout")) return true;
        if (method != PathItem.HttpMethod.GET) return false;
        return path.equals("/api/v1/movies") || path.startsWith("/api/v1/movies/")
            || path.equals("/api/v1/genres") || path.equals("/api/v1/cities")
            || path.equals("/api/v1/cinemas") || path.startsWith("/api/v1/cinemas/")
            || path.equals("/api/v1/showtimes") || path.startsWith("/api/v1/showtimes/")
            || path.equals("/api/v1/combos") || path.equals("/api/v1/pricing");
    }
}
