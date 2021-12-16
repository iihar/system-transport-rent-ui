package org.ihaarr.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.ihaarr.model.User;
import org.ihaarr.model.UserRole;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Date;

@WebFilter("/admin")
public class SecurityFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest)  servletRequest;
        HttpSession session = req.getSession(false);
        HttpServletResponse resp = (HttpServletResponse) servletResponse;
        if(session == null) {
            resp.sendRedirect(req.getContextPath() + "/login");
        } else {
            String token = (String) session.getAttribute("token");
            Claims claims = Jwts.parser().setSigningKey("secret").parseClaimsJws(token).getBody();
            if(claims.getExpiration().before(new Date())) {
                resp.sendRedirect(req.getContextPath() + "/login");
            } else {
                filterChain.doFilter(servletRequest, servletResponse);
            }
        }
    }

    @Override
    public void destroy() {

    }
}
