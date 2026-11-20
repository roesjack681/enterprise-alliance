module.exports = {
  apps: [
    {
      name: "meilisearch", 
      script: "/www/wwwroot/meilisearch/meilisearch-linux-amd64",
      args: [
        "--http-addr", "0.0.0.0:7700",
        "--master-key", process.env.MEILI_MASTER_KEY || ''
      ],
      cwd: "/www/wwwroot/meilisearch",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "4G", // 超过 4G 自动重启
      env: {
        NODE_ENV: "production",
        // 环境变量形式也可以配置，效果等同于 args 中传参
        MEILI_MAX_INDEXING_MEMORY: "4Gb",
        MEILI_MAX_INDEXING_THREADS: "2",
        MEILI_HTTP_PAYLOAD_SIZE_LIMIT: "50Mb",
        MEILI_EXPERIMENTAL_REDUCE_INDEXING_MEMORY_USAGE: "1"
      }
    }
  ]
}
