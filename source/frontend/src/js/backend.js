/* global Blob */
/* eslint-disable camelcase */

import * as d3 from 'd3'

export default class BackendServer {
  constructor (url) {
    this.url = url
    this.connected = false
  }

  init () {
    d3.select('#server-addr').text(this.url)

    d3.json(this.url)
      .then(data => {
        if (data.ok) {
          this.connected = true
          d3.select('#server-status-text').text('Connected')
          d3.select('#btn-discover').style('display', null)
        } else {
          console.error(data)
          this.connected = false
          d3.select('#server-status-text').text('Not Connected')
          d3.select('#btn-discover').style('display', 'none')
        }
      })
      .catch(err => {
        console.error(err)
        this.connected = false
        d3.select('#server-status-text').text('Not Connected')
        d3.select('#btn-discover').style('display', 'none')
      })
  }

  async discoverXesLogFile (fileName, xes_log, case_name, consider_vacuity, min_support, itemsets_support, max_declare_cardinality) {
    const payload = {
      xes_log,
      case_name,
      consider_vacuity,
      min_support,
      itemsets_support,
      max_declare_cardinality
    }

    const promise = new Promise((resolve, reject) => {
      // Send the FormData via a POST request to the Flask server.
      fetch(`${this.url}/discover-xes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          if (data.ok) resolve(data)
          else reject(data)
        })
        .catch(error => {
          reject(error)
        })
    })
    return promise
  }

  // Function to send the .gz file ArrayBuffer to the server
  async discoverXesGzLogFile (fileName, arrayBuffer, case_name, consider_vacuity, min_support, itemsets_support, max_declare_cardinality) {
  // Create a Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/gzip' })

    const formData = new FormData()
    formData.append('file', blob, fileName)
    formData.append('case_name', case_name)
    formData.append('consider_vacuity', consider_vacuity)
    formData.append('min_support', min_support)
    formData.append('itemsets_support', itemsets_support)
    formData.append('max_declare_cardinality', max_declare_cardinality)

    const promise = new Promise((resolve, reject) => {
    // Send the FormData via a POST request to the Flask server.
      fetch(`${this.url}/discover-xes-gz`, {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.ok) resolve(data)
          else reject(data)
        })
        .catch(error => {
          reject(error)
        })
    })
    return promise
  }
}
