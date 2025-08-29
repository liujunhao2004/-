<template>
  <canvas ref="canvas" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const canvas = ref(null);
let ctx = null;
let particles = [];
let animationId = null;

// 配置参数
const config = {
  particleCount: 220, // 粒子数量
  maxDistance: 120, // 粒子间连线距离
  mouseRadius: 180, // 鼠标影响范围
  attractionForce: 0.005, // 鼠标吸引力
  orbitSpeed: 0.02, // 粒子环绕速度
  particleSizeRange: [1, 3] // 粒子大小范围
};

// 鼠标状态
const mouse = {
  x: null,
  y: null,
  isActive: false
};

// 粒子类
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.resetPosition();
    this.size = config.particleSizeRange[0] + Math.random() * (config.particleSizeRange[1] - config.particleSizeRange[0]);
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.color = this.getWhiteColor(); // 纯白色粒子
    this.angle = Math.random() * Math.PI * 2; // 初始角度，用于环绕运动
  }

  // 生成纯白色（固定为255,255,255）
  getWhiteColor() {
    // 可以添加一点随机透明度变化增强层次感
    const opacity = 0.7 + Math.random() * 0.3;
    return `rgba(255, 255, 255, ${opacity})`;
  }

  // 重置位置
  resetPosition() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
  }

  // 更新位置（包含鼠标引力和环绕效果）
  update() {
    // 基础随机运动
    this.x += this.speedX;
    this.y += this.speedY;

    // 鼠标引力和环绕效果
    if (mouse.isActive) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 当粒子在鼠标影响范围内时
      if (distance < config.mouseRadius && distance > 0) {
        // 计算引力
        const force = (1 - distance / config.mouseRadius) * config.attractionForce;

        // 计算环绕速度（垂直于指向鼠标的方向）
        this.angle += config.orbitSpeed;
        const orbitX = Math.sin(this.angle) * 2;
        const orbitY = Math.cos(this.angle) * 2;

        // 应用引力和环绕效果
        this.x += dx * force + orbitX;
        this.y += dy * force + orbitY;
      }
    }

    // 边界反弹
    if (this.x < 0 || this.x > this.canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.speedY *= -1;
  }

  // 绘制粒子
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 绘制连接线（纯白色）
function connectParticles() {
  // 粒子间连线
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.maxDistance) {
        const opacity = 1 - distance / config.maxDistance;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.6})`; // 纯白色连线，带透明度变化
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }

    // 鼠标与粒子连线
    if (mouse.isActive) {
      const dx = particles[i].x - mouse.x;
      const dy = particles[i].y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.mouseRadius) {
        const opacity = 1 - distance / config.mouseRadius;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`; // 纯白色鼠标连线
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
}

// 动画循环
function animate() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  particles.forEach((particle) => {
    particle.update();
    particle.draw(ctx);
  });

  connectParticles();
  animationId = requestAnimationFrame(animate);
}

// 事件处理
function handleMouseMove(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.isActive = true;
}

function handleMouseLeave() {
  mouse.isActive = false;
}

function handleResize() {
  if (!canvas.value) return;

  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
  particles.forEach((particle) => particle.resetPosition());
}

onMounted(() => {
  const c = canvas.value;
  if (!c) return;

  c.width = window.innerWidth;
  c.height = window.innerHeight;
  ctx = c.getContext("2d");

  // 创建粒子
  particles = Array(config.particleCount)
    .fill()
    .map(() => new Particle(c));

  // 启动动画
  animate();

  // 事件监听
  window.addEventListener("resize", handleResize);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseleave", handleMouseLeave);

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseleave", handleMouseLeave);
    cancelAnimationFrame(animationId);
  });
});
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #0d0d0d;
  z-index: -1;
  pointer-events: none;
  background: url("https://cdn.pixabay.com/photo/2018/08/14/13/23/ocean-3605547_1280.jpg") no-repeat;
  background-size: 100% 130%;
}
</style>
