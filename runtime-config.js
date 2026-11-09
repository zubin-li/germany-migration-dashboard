// Static deployments use the bundled, versioned data snapshot by default.
// server.py overrides this response at runtime when its REST API is available.
window.DASHBOARD_RUNTIME = Object.freeze({ apiAvailable: false });
