# Usar usuario no root
USER nextjs

# Exponer puerto correcto para Dokploy / Traefik
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# IMPORTANTE: asegurar que prisma esté disponible en runtime
RUN npm install -g prisma

# Healthcheck real (no depende de auth)
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]