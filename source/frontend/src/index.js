import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.scss'
import config from './config'
import App from './js/app'

window.app = new App(config)
window.app.init()
