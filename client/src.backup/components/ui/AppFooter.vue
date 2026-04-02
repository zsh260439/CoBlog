<script setup lang="ts">
const version = '2026.04.01'
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <span class="footer-version">v{{ version }}</span>

      <nav class="footer-nav">
        <a href="#">GitHub</a>
        <a href="#">Twitter</a>
        <a href="#">邮箱</a>
      </nav>

      <span class="footer-license">MIT License</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 4rem 2rem;
  background: linear-gradient(to bottom, var(--bg-secondary), #1a1a1c);
  border-top: 1px solid var(--border-light);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

@media (min-width: 768px) {
  .footer-inner {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}

.footer-version,
.footer-license {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.footer-nav {
  display: flex;
  gap: 2rem;
}

.footer-nav a {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-nav a:hover {
  color: var(--accent-cyan);
}
</style>
