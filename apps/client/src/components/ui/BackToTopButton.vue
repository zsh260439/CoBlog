<template>
  <el-backtop class="back-top" :visibility-height="360" :right="22" :bottom="24">
    <div class="back-top__inner" aria-label="返回顶部">
      <svg viewBox="0 0 24 24" class="back-top__icon" aria-hidden="true">
        <path d="M12 6.5L5.5 13h3.9v4.5h5.2V13h3.9L12 6.5Z" fill="currentColor" />
      </svg>
    </div>
  </el-backtop>
</template>

<style scoped>
.back-top {
  z-index: 120;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  color: #637086;
  backdrop-filter: blur(10px);
  transition: transform 0.22s ease, color 0.22s ease, border-color 0.22s ease;
}

.back-top:hover {
  transform: translateY(-2px);
  color: var(--text-primary);
  border-color: rgba(15, 23, 42, 0.16);
}

.back-top__inner {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
}

.back-top__icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 767px) {
  .back-top {
    right: 1rem !important;
    bottom: 1rem !important;
  }

  .back-top__inner {
    width: 38px;
    height: 38px;
  }
}
</style>
