# EDD

A web-based editor to model declarative process models using the [easyDeclare](https://github.com/easyDeclare) visual notation.

## Citation

If you use **easyDeclare** or **EDD** in your work, please cite the following paper:
```
@article{easyDeclare,
title = {Improving the understandability of declarative process discovery results using easyDeclare},
author = {Graziano Blasilli and Lauren S. Ferro and Simone Lenti and Fabrizio Maria Maggi and Andrea Marrella and Tiziana Catarci},
journal = {Information Systems},
pages = {102667},
year = {2025},
issn = {0306-4379},
doi = {https://doi.org/10.1016/j.is.2025.102667}
}
```

---

## Usage

A demo video illustrating the main features of EDD is available. You can watch it [here](https://easyDeclare.github.io/EDD/tutorial.mp4).

The tool can be used:
- **Online**: [easyDeclare.github.io/EDD](https://easyDeclare.github.io/EDD). The online version is a limited version of the tool; **it does not support the discovery of declarative process models from a log file**.

- **Locally**: Download the source code and run it locally. Run EDD locally to use the full **version of the tool, including the model discovery**.

### Run EDD Locally

To run EDD locally, you can use **Docker** (suggested) or run it **without Docker**.

#### Using Docker
Run the following command to build the docker image:
```bash
docker compose up --build
```
Then, open a web browser and go to `http://localhost:11234`.

#### Without Docker

Download the source code and run the following commands:

```bash
cd source/backend
pip install -r requirements.txt
python3 main.py
```

Then, open a new terminal and run the following commands:

```bash
cd source/frontend
npm install
npm start
```

Finally, open a web browser and go to `http://localhost:11234`.

---

## Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests for bug fixes and new features.

---

## License

All content is released under the GNU General Public License v3.0 (GPL-3.0) license.
