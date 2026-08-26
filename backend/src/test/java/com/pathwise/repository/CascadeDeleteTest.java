package com.pathwise.repository;

import com.pathwise.BaseIntegrationTest;
import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

class CascadeDeleteTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LearnerProfileRepository learnerProfileRepository;

    @Test
    void testCascadeDeleteUser() {
        User user = new User();
        user.setEmail("cascade@example.com");
        user.setPassword("password");
        user = userRepository.save(user);

        LearnerProfile profile = new LearnerProfile();
        profile.setUser(user);
        profile.setGoal("Testing cascade delete");
        profile = learnerProfileRepository.save(profile);

        // Delete user
        userRepository.deleteById(user.getId());

        // Assert profile is deleted
        assertFalse(learnerProfileRepository.findById(profile.getId()).isPresent(), "Profile should be deleted along with User");
    }
}
