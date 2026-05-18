<script setup lang="ts">
import { siteConfig } from '@/config/site'
const beian = siteConfig.beian
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-meta">
        <span class="footer-license">©{{ currentYear }} {{ siteConfig.name }} · {{ siteConfig.footerLicense }}</span>
      </div>

      <div class="footer-records">
        
        <a
          class="footer-record-link"
          :href="beian.icpUrl"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {{ beian.icpNumber }}
        </a>

        <a
          v-if="beian.publicSecurityNumber && beian.publicSecurityUrl"
          class="footer-record-link footer-record-link--security"
          :href="beian.publicSecurityUrl"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          <svg class="footer-record-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 1.75 4.5 4.7v5.58c0 4.93 2.88 9.44 7.36 11.53l.14.07.14-.07c4.48-2.09 7.36-6.6 7.36-11.53V4.7L12 1.75Zm0 2.16 5.5 2.16v4.21c0 4.05-2.26 7.78-5.5 9.65-3.24-1.87-5.5-5.6-5.5-9.65V6.07L12 3.91Zm-.78 2.84v2.62H8.6v1.76h2.62v2.62h1.56v-2.62h2.62V9.37h-2.62V6.75h-1.56Z"
              fill="currentColor"
            />
          </svg>
          <span>{{ beian.publicSecurityNumber }}</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 2rem;
  background: linear-gradient(to bottom, var(--bg-secondary), #e9ecef);
  border-top: 1px solid var(--border-light);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.footer-meta,
.footer-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
}

@media (min-width: 768px) {
  .footer-inner {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }

  .footer-meta {
    align-items: flex-start;
  }

  .footer-records {
    align-items: flex-end;
  }
}

.footer-version,
.footer-license {
  font-family: var(--font-primary);
  font-size: 0.74rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.footer-record-link {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  font-family: var(--font-primary);
  font-size: 0.74rem;
  line-height: 1.5;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-record-link:hover {
  color: var(--accent-cyan);
}

.footer-record-icon {
  width: 0.95rem;
  height: 0.95rem;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .footer {
    padding: 1.6rem 1.2rem;
  }
}
</style>
