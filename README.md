<h1 align="center"><code>productive-cli(1)</code></h1>

### The missing and working [Productive.io](https://productive.io) CLI client

------

This is a feature packed CLI tool used to seed up mundane Productive operations like:

- time tracking
- timer management (start/stop)
- food time tracking
- checking your working hours
- checking your overtime hours

## Installation

This CLI is not released on NPM or any other package managers but you can still
install it using NPM:

```bash
npm install -g andreicek/productive-cli
```

Or directly from Github:

```bash
wget https://github.com/andreicek/productive-cli/releases/download/v1.5.0/productive-cli
mv productive-cli /usr/bin
```

This currently requires Node LTS (12.18.3)

To start just run `productive-cli` and log-in using your valid credentials. After that you
can add your project using `productive-cli config`.

## Scripting

The CLI supports flags for common usescases that could be used in a script:

### Time tracking food

```
productive-cli --service food
```

### Time tracking on a project

Let's say we have a project at index 0 (indexing corelates with the position of the project
in the picker when running `productive-cli clock`). On that project we can log any ammount
of hours programatically. 

```
produtive-cli \
  --service 0 \
  --time 100 \
  --note "my simple note"
```

## Contributing

I welcome all contributions. Be sure to run a tests and linters before you submiy a PR.
Project setup should look like this:

```
git clone https://github.com/andreicek/productive-cli.git
cd productive-cli
yarn install
yarn lint
yarn test
```

If you don't know where to start take a look at the [good first issue](https://github.com/andreicek/productive-cli/issues?q=is%3Aissue+is%3Aopen+label%3A"good+first+issue") tag.

## License

MIT (2020.)
