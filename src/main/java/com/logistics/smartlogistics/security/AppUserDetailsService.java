package com.logistics.smartlogistics.security;

import com.logistics.smartlogistics.entity.AppUser;
import com.logistics.smartlogistics.repository.AppUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final AppUserRepository appUserRepository;

    public AppUserDetailsService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser user = appUserRepository.findByEmail(username)
                .orElseGet(() -> appUserRepository.findByMobile(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));
        return new User(user.getEmail(), user.getPassword(), user.isActive(), true, true, true,
                List.of(new SimpleGrantedAuthority(user.getRole().name())));
    }
}
