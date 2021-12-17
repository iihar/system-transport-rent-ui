package org.ihaarr.database;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.lang.reflect.InvocationTargetException;
import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;

@Component
public class DbConnectionManager {
    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driverClassName}")
    private String driver;

    private Connection connection;
    private HikariDataSource dataSource;

    public DbConnectionManager(String type) {
        if(DbUsageType.valueOf(type.toUpperCase()) == DbUsageType.POOL) {
            this.dataSource = new HikariDataSource();
            this.dataSource.setJdbcUrl(url);
            this.dataSource.setDriverClassName(driver);
            this.dataSource.setPassword(password);
            this.dataSource.setUsername(username);
            this.dataSource.setPoolName("myPool");
            this.dataSource.addDataSourceProperty("cachePrepStmts" , "true");
            this.dataSource.addDataSourceProperty("prepStmtCacheSize" , "250");
            this.dataSource.addDataSourceProperty("prepStmtCacheSqlLimit" , "2048");
        }
    }

    public Connection createConnection() throws SQLException {
        if(this.dataSource == null) {
            if(this.connection == null) {
                try {
                    DriverManager.registerDriver(new org.h2.Driver());
                    this.connection = DriverManager.getConnection(this.url, this.username, this.password);
                } catch (SQLException throwable) {
                    throwable.printStackTrace();
                }
            }
        } else {
            return dataSource.getConnection();
        }

        return this.connection;
    }

    public void closeConnection() {
        try {
            if (connection != null) {
                try {
                    connection.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
