package org.ihaarr.configuration;

import org.ihaarr.database.DbConnectionManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "classpath:/application.properties")
@ComponentScan("org.ihaarr")
public class MainConfig {

    @Bean
    public DbConnectionManager dbConnectionManager(@Value("${spring.datasource.type}") String type) {
        return new DbConnectionManager(type);
    }
}
