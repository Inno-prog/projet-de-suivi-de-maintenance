package com.dgsi.maintenance.config;

import java.util.logging.Logger;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class ContratDataInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(ContratDataInitializer.class.getName());

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Contrat data initialization skipped - using existing database data");
    }
}
