# CI-CD-Pipeline
Practice Production Ready CI/CD  Pipeline

                    GitHub
                       │
                feature branch
                       │
                       ▼
                      PR
                       │
             ┌─────────┴─────────┐
             │                   │
           Lint                Tests
             │                   │
             └─────────┬─────────┘
                       │
                     Merge
                       │
                       ▼
                     main
                       │
                       ▼
                Docker Build
                       │
                       ▼
                    Trivy
                       │
                       ▼
                     GHCR
                       │
                 abc123 image
                       │
                       ▼
                 STAGING
                       │
                       ▼
                Smoke Tests
                       │
                  PASS?
                 /      \
               NO        YES
               │          │
              STOP        ▼
                     Production
                       │
                       ▼
                Manual Approval
                       │
                       ▼
                  PRODUCTION
                       │
                       ▼
                 SAME abc123
