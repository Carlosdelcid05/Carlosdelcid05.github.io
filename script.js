// JavaScript para el portafolio
// Menú hamburguesa para versión móvil
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = navMenu.querySelectorAll('a');

    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', menuToggle.classList.contains('active'));
    });

    // Cerrar menú cuando se hace click en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Cerrar menú cuando se hace click fuera
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target) || menuToggle.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
    console.log('Portafolio cargado correctamente');

    const themeToggle = document.getElementById('theme-toggle');
    const languageToggle = document.getElementById('language-toggle');
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let currentLanguage = savedLanguage === 'es' || savedLanguage === 'en' ? savedLanguage : 'en';

    const translations = {
        en: {
            documentTitle: 'My Portfolio - Systems and Computer Science Engineer',
            profileRole: 'Systems and Computer Science Engineer',
            navAbout: 'About',
            navSkills: 'Skills',
            navProjects: 'Projects',
            navContact: 'Contact',
            aboutTitle: 'About Me',
            aboutText: 'I am a Systems and Computer Science Engineer passionate about technology and innovation. I have experience in software development, databases, and information systems. I am dedicated to creating efficient and scalable solutions to solve complex problems.',
            skillsTitle: 'Technical Skills',
            skillStack: 'Tech Stack',
            skillAlgorithms: 'Algorithms & Data Structures',
            skillSystems: 'Systems & Low-Level',
            skillModeling: 'Modeling & Optimization',
            projectsTitle: 'Projects',
            project1Title: 'Mathematical Academic Software',
            project1Desc: 'Multiplatform program developed in Flutter for the academic resolution of numerical calculations through sophisticated mathematical algorithms in a didactic way.',
            project2Title: 'Clothing Inventory and Sales System',
            project2Desc: 'Clothing inventory system for the administration and sale of bulk clothing developed with Flutter and PostgreSQL',
            project3Title: 'Coming soon',
            project3Desc: 'Coming soon',
            technologiesLabel: 'Technologies:',
            contactTitle: 'Contact',
            phoneLabel: 'Phone:',
            footerText: '© 2026 Carlos del Cid. All rights reserved.',
            languageButton: 'Español',
            languageAria: 'Switch language to Spanish',
            themeDark: 'Dark',
            themeLight: 'Light',
            themeDarkAria: 'Switch to dark theme',
            themeLightAria: 'Switch to light theme'
        },
        es: {
            documentTitle: 'Mi Portafolio - Ingeniero en Ciencias y Sistemas',
            profileRole: 'Ingeniero en Ciencias y Sistemas',
            navAbout: 'Acerca de',
            navSkills: 'Habilidades',
            navProjects: 'Proyectos',
            navContact: 'Contacto',
            aboutTitle: 'Acerca de mí',
            aboutText: 'Soy un Ingeniero en Ciencias y Sistemas apasionado por la tecnología y la innovación. Tengo experiencia en desarrollo de software, bases de datos y sistemas de información. Me dedico a crear soluciones eficientes y escalables para resolver problemas complejos.',
            skillsTitle: 'Habilidades Técnicas',
            skillStack: 'Stack Tecnológico',
            skillAlgorithms: 'Algoritmos y Estructuras de Datos',
            skillSystems: 'Sistemas y Bajo Nivel',
            skillModeling: 'Modelado y Optimización',
            projectsTitle: 'Proyectos',
            project1Title: 'Software Académico Matemático',
            project1Desc: 'Programa multiplataforma desarrollado en Flutter para la resolución académica de cálculos numéricos por medio de algoritmos matemáticos sofisticados de forma didáctica.',
            project2Title: 'Sistema de Inventario y Venta de Ropa',
            project2Desc: 'Sistema de inventario para la administración y venta de ropa de paca desarrollado con Flutter y PostgreSQL',
            project3Title: 'Próximamente',
            project3Desc: 'Próximamente',
            technologiesLabel: 'Tecnologías:',
            contactTitle: 'Contacto',
            phoneLabel: 'Teléfono:',
            footerText: '© 2026 Carlos del Cid. Todos los derechos reservados.',
            languageButton: 'English',
            languageAria: 'Cambiar idioma a inglés',
            themeDark: 'Oscuro',
            themeLight: 'Claro',
            themeDarkAria: 'Cambiar a tema oscuro',
            themeLightAria: 'Cambiar a tema claro'
        }
    };

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    };

    const applyLanguage = (language) => {
        const t = translations[language];

        document.documentElement.lang = language;
        document.title = t.documentTitle;

        setText('profile-role', t.profileRole);
        setText('nav-about', t.navAbout);
        setText('nav-skills', t.navSkills);
        setText('nav-projects', t.navProjects);
        setText('nav-contact', t.navContact);
        setText('about-title', t.aboutTitle);
        setText('about-text', t.aboutText);
        setText('skills-title', t.skillsTitle);
        setText('skill-stack', t.skillStack);
        setText('skill-algorithms', t.skillAlgorithms);
        setText('skill-systems', t.skillSystems);
        setText('skill-modeling', t.skillModeling);
        setText('projects-title', t.projectsTitle);
        setText('project-1-title', t.project1Title);
        setText('project-1-desc', t.project1Desc);
        setText('project-2-title', t.project2Title);
        setText('project-2-desc', t.project2Desc);
        setText('project-3-title', t.project3Title);
        setText('project-3-desc', t.project3Desc);
        setText('project-tech-label-1', t.technologiesLabel);
        setText('project-tech-label-2', t.technologiesLabel);
        setText('project-tech-label-3', t.technologiesLabel);
        setText('contact-title', t.contactTitle);
        setText('phone-label', t.phoneLabel);
        setText('footer-text', t.footerText);
        setText('language-toggle', t.languageButton);

        languageToggle.setAttribute('aria-label', t.languageAria);
        updateThemeButton();
    };

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
    };

    if (savedTheme === 'dark' || savedTheme === 'light') {
        applyTheme(savedTheme);
    } else {
        applyTheme(systemThemeQuery.matches ? 'dark' : 'light');
    }

    const updateThemeButton = () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        const t = translations[currentLanguage];

        themeToggle.textContent = isDark ? t.themeLight : t.themeDark;
        themeToggle.setAttribute('aria-label', isDark ? t.themeLightAria : t.themeDarkAria);
    };

    applyLanguage(currentLanguage);
    updateThemeButton();

    languageToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
        localStorage.setItem('language', currentLanguage);
        applyLanguage(currentLanguage);
    });

    themeToggle.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        const nextTheme = isDark ? 'light' : 'dark';

        applyTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);

        updateThemeButton();
    });

    systemThemeQuery.addEventListener('change', (event) => {
        const userPreference = localStorage.getItem('theme');

        if (userPreference === 'dark' || userPreference === 'light') {
            return;
        }

        applyTheme(event.matches ? 'dark' : 'light');
        updateThemeButton();
    });
});
