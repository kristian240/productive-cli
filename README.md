# The missing and working Productive.io clocking CLI

## Installation

```bash
npm install -g andreicek/productive-cli
```

## Usage

For the first time run `productive-cli init` and enter your API token. To add
new services run `productive-cli config`. It's possible to edit the config file by
hand if you can't find the service with the tool - `~/.productivecli`.

```
Usage: productive-cli <command> [options]

Commands:
  productive-cli init    Init the cli
  productive-cli config  Add new services
  productive-cli clock   Create a new entry
  productive-cli stats   Show stats

Options:
  --version      Show version number                                   [boolean]
  -s, --service  Service
  -t, --time     Time in minutes
  -n, --note     Note
  -h, --help     Show help                                             [boolean]
```

## License

MIT (2020.)
