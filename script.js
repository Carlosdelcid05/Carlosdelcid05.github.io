document.addEventListener('DOMContentLoaded', function() {
    // ==== Hamburger Menu Toggle ====
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = navMenu.querySelectorAll('a, button');

    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', menuToggle.classList.contains('active'));
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target) || menuToggle.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // ==== Typewriter Effect (declared early so translations can re-trigger it) ====
    let typewriterTimeout = null;
    function initTypewriter() {
        const el = document.querySelector('.typewriter');
        if (!el) return;

        const text = el.textContent.trim() || el.dataset.text;
        el.textContent = '';
        el.classList.add('typewriter-active');
        el.classList.remove('typewriter-done');

        if (typewriterTimeout) clearTimeout(typewriterTimeout);

        let i = 0;
        const speed = 50;

        const type = () => {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                typewriterTimeout = setTimeout(type, speed);
            } else {
                el.classList.remove('typewriter-active');
                el.classList.add('typewriter-done');
            }
        };

        typewriterTimeout = setTimeout(type, 300);
    }

    // ==== Theme & Language ====
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
            skillBackendTitle: 'Backend & Scripting',
            skillBackendDesc: 'Java, C#, Go, Python, Rust, Bash',
            skillFrontendTitle: 'Frontend & Mobile',
            skillFrontendDesc: 'JavaScript, Dart, Flutter basics',
            skillDatabasesTitle: 'Databases',
            skillDatabasesDesc: 'SQL, relational modeling, query optimization basics',
            skillCloudTitle: 'Cloud & DevOps',
            skillCloudDesc: 'AWS fundamentals, AWS IoT Core, Linux environments, task automation',
            skillIoTTitle: 'IoT & Embedded',
            skillIotDesc: 'Arduino, Raspberry Pi, sensors/actuators, serial communication, MQTT',
            skillAiTitle: 'AI API Integrations',
            skillAiDesc: 'DeepSeek and OpenRouter integration for intelligent assistants and automation',
            skillFoundationsTitle: 'Computer Science Foundations',
            skillFoundationsDesc: 'Algorithms, data structures, digital logic, assembly, operating systems, modeling and optimization',
            skillNosqlTitle: 'NoSQL Databases',
            skillNosqlDesc: 'Neo4J (graph), MongoDB (document), Redis (in-memory key-value)',
            skillScrumTitle: 'SCRUM',
            skillScrumDesc: 'Agile methodology, sprints, user stories, daily standups, retrospectives',
            skillGitflowTitle: 'GitFlow',
            skillGitflowDesc: 'Branching model with main, develop, feature, release and hotfix workflows',
            skillCicdTitle: 'CI/CD',
            skillCicdDesc: 'Continuous integration and deployment pipelines, automated testing and delivery',
            skillNetworkingTitle: 'Layer 2 Networking',
            skillNetworkingDesc: 'VLANs, STP, EtherChannel, switching fundamentals, MAC tables',
            skillDockerTitle: 'Docker & Docker Compose',
            skillDockerDesc: 'Containerization, images, multi-container orchestration with compose files',
            projectsTitle: 'Projects',
            project1Title: 'Mathematical Academic Software',
            project1Desc: 'Multiplatform program developed in Flutter for the academic resolution of numerical calculations through sophisticated mathematical algorithms in a didactic way.',
            project2Title: 'Clothing Inventory and Sales System',
            project2Desc: 'Clothing inventory system for the administration and sale of bulk clothing developed with Flutter and PostgreSQL',
            project3Title: 'Code Analyzer - Local Compiler',
            project3Desc: 'Frontend for code analysis with local compiler integration, execution output, syntax/semantic error reporting, symbol table, and AST visualization.',
            projectPemtreeTitle: 'PEMTREE',
            projectPemtreeDesc: 'Interactive graph visualizer for academic course paths and prerequisites. Explore pensum routes, critical paths, and semester planning.',
            technologiesLabel: 'Technologies:',
            contactTitle: 'Contact',
            phoneLabel: 'phone',
            phoneValue: '+502 4080 9821',
            footerText: '© 2026 Carlos del Cid. All rights reserved.',
            languageButton: 'Español',
            languageAria: 'Switch language to Spanish',
            themeDark: 'Dark',
            themeLight: 'Light',
            themeDarkAria: 'Switch to dark theme',
            themeLightAria: 'Switch to light theme',
            backToTopAria: 'Back to top',
            builtWith: 'built with',
            and: '&',
            cleanCode: 'clean code'
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
            skillBackendTitle: 'Backend y Scripting',
            skillBackendDesc: 'Java, C#, Go, Python, Rust, Bash',
            skillFrontendTitle: 'Frontend y Móvil',
            skillFrontendDesc: 'JavaScript, Dart, bases de Flutter',
            skillDatabasesTitle: 'Bases de Datos',
            skillDatabasesDesc: 'SQL, modelado relacional, fundamentos de optimización de consultas',
            skillCloudTitle: 'Cloud y DevOps',
            skillCloudDesc: 'Fundamentos de AWS, AWS IoT Core, entornos Linux, automatización de tareas',
            skillIoTTitle: 'IoT y Embebidos',
            skillIoTDesc: 'Arduino, Raspberry Pi, sensores/actuadores, comunicación serial, MQTT',
            skillAiTitle: 'Integración de APIs de IA',
            skillAiDesc: 'Integración con DeepSeek y OpenRouter para asistentes inteligentes y automatización',
            skillFoundationsTitle: 'Fundamentos de Ciencias de la Computación',
            skillFoundationsDesc: 'Algoritmos, estructuras de datos, lógica digital, ensamblador, sistemas operativos, modelado y optimización',
            skillNosqlTitle: 'Bases de Datos NoSQL',
            skillNosqlDesc: 'Neo4J (grafos), MongoDB (documentos), Redis (clave-valor en memoria)',
            skillScrumTitle: 'SCRUM',
            skillScrumDesc: 'Metodología ágil, sprints, historias de usuario, dailies y retrospectivas',
            skillGitflowTitle: 'GitFlow',
            skillGitflowDesc: 'Modelo de ramificación con main, develop, feature, release y hotfix',
            skillCicdTitle: 'CI/CD',
            skillCicdDesc: 'Pipelines de integración y despliegue continuos, testing automatizado',
            skillNetworkingTitle: 'Redes de Capa 2',
            skillNetworkingDesc: 'VLANs, STP, EtherChannel, fundamentos de conmutación, tablas MAC',
            skillDockerTitle: 'Docker y Docker Compose',
            skillDockerDesc: 'Containerización, imágenes, orquestación multi-contenedor con compose',
            projectsTitle: 'Proyectos',
            project1Title: 'Software Académico Matemático',
            project1Desc: 'Programa multiplataforma desarrollado en Flutter para la resolución académica de cálculos numéricos por medio de algoritmos matemáticos sofisticados de forma didáctica.',
            project2Title: 'Sistema de Inventario y Venta de Ropa',
            project2Desc: 'Sistema de inventario para la administración y venta de ropa de paca desarrollado con Flutter y PostgreSQL',
            project3Title: 'Analizador de Código - Compilador Local',
            project3Desc: 'Frontend para análisis de código con compilador local integrado, salida de ejecución, reporte de errores sintácticos/semánticos, tabla de símbolos y visualización del AST.',
            projectPemtreeTitle: 'PEMTREE',
            projectPemtreeDesc: 'Visualizador interactivo de grafos para rutas y prerrequisitos académicos. Explora rutas de pensum, rutas críticas y planificación de semestres.',
            technologiesLabel: 'Tecnologías:',
            contactTitle: 'Contacto',
            phoneLabel: 'teléfono',
            phoneValue: '+502 4080 9821',
            footerText: '© 2026 Carlos del Cid. Todos los derechos reservados.',
            languageButton: 'English',
            languageAria: 'Cambiar idioma a inglés',
            themeDark: 'Oscuro',
            themeLight: 'Claro',
            themeDarkAria: 'Cambiar a tema oscuro',
            themeLightAria: 'Cambiar a tema claro',
            backToTopAria: 'Volver arriba',
            builtWith: 'construido con',
            and: 'y',
            cleanCode: 'código limpio'
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

        const setNavLink = (id, value) => {
            const el = document.getElementById(id);
            if (el) {
                const prefix = el.querySelector('.nav-prefix');
                const prefixText = prefix ? prefix.outerHTML : '';
                el.innerHTML = prefixText + value;
            }
        };
        setNavLink('nav-about', t.navAbout);
        setNavLink('nav-skills', t.navSkills);
        setNavLink('nav-projects', t.navProjects);
        setNavLink('nav-contact', t.navContact);
        setText('about-title', t.aboutTitle);
        setText('about-text', t.aboutText);
        setText('skills-title', t.skillsTitle);
        setText('skill-backend-title', t.skillBackendTitle);
        setText('skill-backend-desc', t.skillBackendDesc);
        setText('skill-frontend-title', t.skillFrontendTitle);
        setText('skill-frontend-desc', t.skillFrontendDesc);
        setText('skill-databases-title', t.skillDatabasesTitle);
        setText('skill-databases-desc', t.skillDatabasesDesc);
        setText('skill-cloud-title', t.skillCloudTitle);
        setText('skill-cloud-desc', t.skillCloudDesc);
        setText('skill-iot-title', t.skillIoTTitle);
        setText('skill-iot-desc', t.skillIoTDesc);
        setText('skill-ai-title', t.skillAiTitle);
        setText('skill-ai-desc', t.skillAiDesc);
        setText('skill-foundations-title', t.skillFoundationsTitle);
        setText('skill-foundations-desc', t.skillFoundationsDesc);
        setText('skill-nosql-title', t.skillNosqlTitle);
        setText('skill-nosql-desc', t.skillNosqlDesc);
        setText('skill-scrum-title', t.skillScrumTitle);
        setText('skill-scrum-desc', t.skillScrumDesc);
        setText('skill-gitflow-title', t.skillGitflowTitle);
        setText('skill-gitflow-desc', t.skillGitflowDesc);
        setText('skill-cicd-title', t.skillCicdTitle);
        setText('skill-cicd-desc', t.skillCicdDesc);
        setText('skill-networking-title', t.skillNetworkingTitle);
        setText('skill-networking-desc', t.skillNetworkingDesc);
        setText('skill-docker-title', t.skillDockerTitle);
        setText('skill-docker-desc', t.skillDockerDesc);
        setText('projects-title', t.projectsTitle);
        setText('project-1-title', t.project1Title);
        setText('project-1-desc', t.project1Desc);
        setText('project-2-title', t.project2Title);
        setText('project-2-desc', t.project2Desc);
        setText('project-3-title', t.project3Title);
        setText('project-3-desc', t.project3Desc);
        setText('project-pemtree-title', t.projectPemtreeTitle);
        setText('project-pemtree-desc', t.projectPemtreeDesc);
        setText('project-tech-label-1', t.technologiesLabel);
        setText('project-tech-label-2', t.technologiesLabel);
        setText('project-tech-label-3', t.technologiesLabel);
        setText('project-tech-label-pemtree', t.technologiesLabel);
        setText('contact-title', t.contactTitle);
        setText('phone-label', t.phoneLabel);
        setText('phone-value', t.phoneValue);
        setText('footer-text', t.footerText);
        setText('language-toggle', t.languageButton);

        languageToggle.setAttribute('aria-label', t.languageAria);
        updateThemeButton();

        // Restart typewriter with new text
        initTypewriter();
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

    // ==== Typewriter Effect ====
    // (defined after theme/language to be available for them)

    // ==== Scroll Reveal ====
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                        entry.target.querySelectorAll('.skill-card, .project-card').forEach((card, i) => {
                            setTimeout(() => card.classList.add('is-visible'), i * 60);
                        });
                    }, index * 80);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => {
            el.classList.add('is-visible');
            el.querySelectorAll('.skill-card, .project-card').forEach(card => card.classList.add('is-visible'));
        });
    }

    // ==== Active Section in Nav + Magic Pill + Scroll Progress ====
    const sections = document.querySelectorAll('section[id], header[data-section-theme]');
    const navItems = document.querySelectorAll('.nav-item');
    const navPill = document.getElementById('nav-pill');
    const navEl = document.getElementById('main-nav');
    const progressBar = document.getElementById('nav-progress-bar');

    const sectionThemes = {
        warm: { color: '#fb923c', soft: 'rgba(251, 146, 60, 0.18)' },
        trust: { color: '#3b82f6', soft: 'rgba(59, 130, 246, 0.18)' },
        tech: { color: '#06b6d4', soft: 'rgba(6, 182, 212, 0.18)' },
        creative: { color: '#a855f7', soft: 'rgba(168, 85, 247, 0.18)' },
        action: { color: '#f43f5e', soft: 'rgba(244, 63, 94, 0.18)' }
    };

    const applySectionTheme = (theme) => {
        if (!theme) return;
        const colors = sectionThemes[theme];
        if (colors) {
            document.documentElement.style.setProperty('--section-glow', colors.color);
            document.documentElement.style.setProperty('--section-glow-soft', colors.soft);
        }
    };

    // ==== Magic Pill: slides smoothly between active nav items ====
    const movePill = (activeItem) => {
        if (!navPill || !activeItem || window.innerWidth <= 768) {
            if (navPill) {
                navPill.style.opacity = '0';
                navPill.style.width = '0';
            }
            return;
        }
        const navRect = navEl.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const x = itemRect.left - navRect.left;
        const width = itemRect.width;

        navPill.style.opacity = '1';
        navPill.style.transform = `translateX(${x}px)`;
        navPill.style.width = `${width}px`;

        // Update pill color from active item
        const itemColor = getComputedStyle(activeItem).getPropertyValue('--item-color').trim() || '#fb923c';
        const itemColor2 = getComputedStyle(activeItem).getPropertyValue('--item-color-2').trim() || '#ec4899';
        const itemColorSoft = getComputedStyle(activeItem).getPropertyValue('--item-color-soft').trim() || 'rgba(251, 146, 60, 0.4)';
        navPill.style.setProperty('--item-color', itemColor);
        navPill.style.setProperty('--item-color-2', itemColor2);
        navPill.style.setProperty('--item-color-soft', itemColorSoft);
    };

    // ==== Scroll Progress Bar ====
    const updateProgress = () => {
        if (!progressBar) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    // ==== Compact mode on scroll ====
    let lastScroll = 0;
    const handleScroll = () => {
        const scrollY = window.scrollY;
        if (scrollY > 80) {
            navEl.classList.add('is-scrolled');
        } else {
            navEl.classList.remove('is-scrolled');
        }
        lastScroll = scrollY;
        updateProgress();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if ('IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let id = entry.target.getAttribute('id');
                    // Map header to "about" so the first nav item is active at the top
                    if (entry.target.tagName.toLowerCase() === 'header') {
                        id = 'about';
                    }
                    let activeItem = null;
                    navItems.forEach(item => {
                        const isActive = item.getAttribute('href') === `#${id}`;
                        item.classList.toggle('active', isActive);
                        if (isActive) activeItem = item;
                    });
                    if (activeItem) movePill(activeItem);
                    const theme = entry.target.dataset.sectionTheme;
                    if (theme) applySectionTheme(theme);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '-30% 0px -50% 0px'
        });

        sections.forEach(section => navObserver.observe(section));
    }

    // Recalculate pill on resize
    window.addEventListener('resize', () => {
        const activeItem = document.querySelector('.nav-item.active');
        if (activeItem) movePill(activeItem);
    });

    // ==== Magnetic effect on nav items ====
    if (window.matchMedia('(hover: hover)').matches) {
        navItems.forEach(item => {
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                item.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px)`;
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = '';
            });
        });
    }

    // ==== Tilt Effect on Cards with mouse-tracking glow ====
    const tiltElements = document.querySelectorAll('.tilt');

    const handleTilt = (el, event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const depth = parseFloat(el.dataset.tiltDepth) || 6;

        const rotateX = ((y - centerY) / centerY) * -depth;
        const rotateY = ((x - centerX) / centerX) * depth;

        const card = el.querySelector('.skill-card, .project-card');
        if (card) {
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(-2px, -2px)`;
            // Update mouse position for radial glow
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${percentX}%`);
            card.style.setProperty('--mouse-y', `${percentY}%`);
        }
    };

    const resetTilt = (el) => {
        const card = el.querySelector('.skill-card, .project-card');
        if (card) {
            card.style.transform = '';
        }
    };

    if (window.matchMedia('(hover: hover)').matches) {
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => handleTilt(el, e));
            el.addEventListener('mouseleave', () => resetTilt(el));
        });
    }

    // ==== Cursor Glow ====
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let glowX = 0;
        let glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorGlow.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });

        const animateGlow = () => {
            glowX += (mouseX - glowX) * 0.12;
            glowY += (mouseY - glowY) * 0.12;
            cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateGlow);
        };
        animateGlow();
    }

    // ==== Back to Top Button ====
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        const translations_t = translations[currentLanguage];
        backToTop.setAttribute('aria-label', translations_t.backToTopAria);

        const toggleBackToTop = () => {
            backToTop.classList.toggle('is-visible', window.scrollY > 400);
        };

        window.addEventListener('scroll', toggleBackToTop, { passive: true });
        toggleBackToTop();

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Update aria on language change
        const originalApplyLanguage = applyLanguage;
        // already updates via applyLanguage
    }

    // ==== Konami-style Easter Egg: keyboard sequence for theme shake ====
    const konamiKeys = [];
    const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
    document.addEventListener('keydown', (e) => {
        konamiKeys.push(e.key);
        if (konamiKeys.length > konamiPattern.length) konamiKeys.shift();
        if (konamiKeys.join(',') === konamiPattern.join(',')) {
            document.body.classList.add('konami-shake');
            setTimeout(() => document.body.classList.remove('konami-shake'), 600);
            konamiKeys.length = 0;
        }
    });

    // ==== Interactive Particle System (canvas) ====
    const canvas = document.getElementById('particles');
    if (canvas && window.matchMedia('(hover: hover)').matches) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = -1000;
        let mouseY = -1000;
        let sectionColor = '#fb923c';
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        const resize = () => {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * window.innerHeight;
                this.trail = [];
            }
            reset() {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 0.5;
                this.life = 0;
                this.maxLife = Math.random() * 200 + 100;
            }
            update() {
                this.life++;
                if (this.life > this.maxLife) {
                    this.reset();
                    return;
                }
                // Mouse attraction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 180) {
                    const force = (180 - dist) / 180 * 0.4;
                    this.vx += (dx / dist) * force * 0.15;
                    this.vy += (dy / dist) * force * 0.15;
                }
                this.vx *= 0.96;
                this.vy *= 0.96;
                this.x += this.vx;
                this.y += this.vy;
                // Wrap
                if (this.x < 0) this.x = window.innerWidth;
                if (this.x > window.innerWidth) this.x = 0;
                if (this.y < 0) this.y = window.innerHeight;
                if (this.y > window.innerHeight) this.y = 0;
            }
            draw() {
                const alpha = 1 - (this.life / this.maxLife);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = sectionColor + Math.floor(alpha * 200).toString(16).padStart(2, '0');
                ctx.fill();
            }
        }

        // Create particles
        const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Connect nearby particles
        const connectParticles = () => {
            const maxDist = 120;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * 0.4;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = sectionColor + Math.floor(alpha * 150).toString(16).padStart(2, '0');
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
                // Connect to mouse
                const dxm = particles[i].x - mouseX;
                const dym = particles[i].y - mouseY;
                const distm = Math.sqrt(dxm * dxm + dym * dym);
                if (distm < 150) {
                    const alpha = (1 - distm / 150) * 0.6;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = sectionColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            requestAnimationFrame(animate);
        };
        animate();

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        // Watch section theme
        const themeObserver = new MutationObserver(() => {
            const glow = getComputedStyle(document.documentElement).getPropertyValue('--section-glow').trim();
            if (glow) sectionColor = glow;
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    }

    // ==== Click Ripple & Sparkle Effect ====
    const rippleColors = ['#fb923c', '#ec4899', '#a855f7', '#06b6d4', '#10b981', '#f43f5e'];
    document.addEventListener('click', (e) => {
        // Ripple at click position
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        const size = 80;
        const color = rippleColors[Math.floor(Math.random() * rippleColors.length)];
        ripple.style.cssText = `
            left: ${e.clientX - size/2}px;
            top: ${e.clientY - size/2}px;
            width: ${size}px;
            height: ${size}px;
            --ripple-color: ${color};
        `;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);

        // Sparkles around click
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            const angle = (i / 8) * Math.PI * 2;
            const dist = 40 + Math.random() * 30;
            sparkle.style.cssText = `
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                background: ${color};
                --dx: ${Math.cos(angle) * dist}px;
                --dy: ${Math.sin(angle) * dist}px;
                animation: sparkleFade 0.6s ease-out forwards;
            `;
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 600);
        }
    });

    // ==== Magnetic Buttons (theme/language toggles) ====
    if (window.matchMedia('(hover: hover)').matches) {
        const magneticButtons = document.querySelectorAll('.theme-toggle, .language-toggle, .back-to-top');
        magneticButtons.forEach(btn => {
            btn.classList.add('magnetic');
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    console.log('%c> portfolio loaded', 'color: #fb923c; font-weight: bold; background: #0a0a0a; padding: 4px 8px;');
    console.log('%c> welcome, stranger.', 'color: #a855f7; font-style: italic;');
});
