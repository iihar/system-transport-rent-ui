package org.ihaarr.model;

import java.math.BigDecimal;

public class User {
    private Long id;
    private String login;
    private String password;
    private BigDecimal balance;
    private UserRole role;

    public User(Long id, String login, String password, BigDecimal balance, UserRole role) {
        this.id = id;
        this.login = login;
        this.password = password;
        this.balance = balance;
        this.role = role;
    }

    public User() {

    }

    public Long getId() {
        return this.id;
    }
    public String getLogin() {
        return this.login;
    }
    public String getPassword() {
        return this.password;
    }
    public UserRole getUserRole() {
        return this.role;
    }
    public BigDecimal getBalance() {
        return this.balance;
    }
}
