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
Usage: index.js <command> [options]

Commands:
  index.js init    Init the cli
  index.js config  Add new services
  index.js clock   Create a new entry
  index.js timer   Start a timer
  index.js stats   Show stats

Options:
  --version      Show version number                                 [boolean]
  -s, --service  Service
  -t, --time     Time in minutes
  -n, --note     Note
  -h, --help     Show help                                           [boolean]
```

## License

MIT (2020.)
