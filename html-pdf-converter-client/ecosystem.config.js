module.exports = {
    apps: [
      {
        name: 'html-pdf-converter-client',
        script: 'serve',
        args: '-s build -l 3002', // Указывает на порт, на котором будет работать сервер
        cwd: './build', // Рабочий каталог (по умолчанию это корень проекта)
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  