package com.vendorconnect.web.response

data class LayerResponse(val layer: String, val reachable: Boolean, val detail: String)

data class ConnectivityResponse(val status: String, val layers: List<LayerResponse>)
