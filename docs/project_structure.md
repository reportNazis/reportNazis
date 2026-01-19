visine-sunflower/
├── admin-backend-workspace/
│   ├── asset-service/
│   │   ├── app/
│   │   ├── worker/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── management-service/
│   │   ├── app/
│   │   ├── worker/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── Dockerfile
├── docs/
│   ├── project_structure.md
│   └── architecture.puml
├── docker-compose.yml
├── reverse-proxy/
│   └── nginx.conf
├── form-service/
│   ├── src/
│   ├── test/
│   │   └── health.test.js
│   ├── package.json
│   └── jest.config.js
├── identity-service/
│   ├── src/
│   ├── test/
│   │   └── health.test.js
│   ├── package.json
│   └── jest.config.js
├── log-service/
│   ├── src/
│   ├── test/
│   │   └── health.test.js
│   ├── package.json
│   └── jest.config.js
└── frontend-workspace/ (Angular Monorepo)
    ├── angular.json
    └── projects/
        ├── shared-lib/
        │   └── src/lib/
        │       ├── api.service.ts
        │       ├── api.service.spec.ts
        │       ├── auth.service.ts
        │       └── auth.service.spec.ts
        ├── frontend-user/
        │   └── src/app/
        │       └── dynamic-forms/ (Standalone Components from Legacy)
        └── frontend-admin/
            └── src/app/
                ├── login/
                ├── user-overview/
                └── invite-generator/
```
