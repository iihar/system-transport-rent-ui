package org.ihaarr.servlets;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.ihaarr.database.DbConnectionManager;
import org.ihaarr.model.User;
import org.ihaarr.model.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    @Autowired
    private DbConnectionManager dbConnectionManager;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String login = req.getParameter("login");
        String pass = req.getParameter("pass");
        PrintWriter pr = resp.getWriter();
        if(login == null || pass == null || login.isEmpty() || pass.isEmpty()) {
            pr.println("login or pass isn't correct");
        } else {
            HttpSession session = req.getSession(false);
            if(session == null) {
                session = req.getSession(true);
            }
            try {
                String query = "select * from users where password = ?";
                PreparedStatement stmt = dbConnectionManager.createConnection().prepareStatement(query);
                stmt.setString(1 , pass);
                ResultSet resultSet = stmt.executeQuery();
                if(resultSet.next()) {
                    if(pass.equals(resultSet.getString("password"))) {
                        Long id = Long.valueOf(resultSet.getString("id"));
                        BigDecimal balance = BigDecimal.valueOf(Double.parseDouble(resultSet.getString("balance")));
                        UserRole role = UserRole.valueOf(resultSet.getString("role"));
                        String jwt = generateJwt(new User(id, login, pass, balance, role));
                        session.setAttribute("login", login);
                        session.setAttribute("id", id);
                        session.setAttribute("balance", balance);
                        session.setAttribute("role", role);
                        session.setAttribute("token", jwt);
                    } else {
                        pr.println("Incorrect password");
                    }
                }

            } catch (SQLException e) {
                e.printStackTrace();
            } finally {
                dbConnectionManager.closeConnection();
            }
        }
        pr.close();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setCharacterEncoding("UTF-8");
        req.getRequestDispatcher("/pages/auth.html").forward(req, resp);
    }

    private String generateJwt(User user) {
        String secret = "secret";
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("login", user.getLogin());
        claims.put("balance", user.getBalance());
        claims.put("role", user.getUserRole().toString());

        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + 60 * 60 * 1000);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId().toString())
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    public void init(ServletConfig config) throws ServletException {
        SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext (this);
    }
}
