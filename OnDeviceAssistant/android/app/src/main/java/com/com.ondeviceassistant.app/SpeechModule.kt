package com.ondeviceassistant.app

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class SpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), RecognitionListener {

    private var speechRecognizer: SpeechRecognizer? = null

    override fun getName(): String = "SpeechModule"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun startListening(locale: String) {
        val activity = reactContext.currentActivity ?: return
        activity.runOnUiThread {
            try {
                speechRecognizer?.destroy()
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)
                speechRecognizer?.setRecognitionListener(this)

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                }
                speechRecognizer?.startListening(intent)
            } catch (e: Exception) {
                val params = Arguments.createMap().apply {
                    putString("error", e.message ?: "Unknown error")
                }
                sendEvent("onSpeechError", params)
            }
        }
    }

    @ReactMethod
    fun stopListening() {
        val activity = reactContext.currentActivity ?: return
        activity.runOnUiThread {
            try {
                speechRecognizer?.stopListening()
            } catch (e: Exception) {
                // ignore
            }
        }
    }

    @ReactMethod
    fun cancel() {
        val activity = reactContext.currentActivity ?: return
        activity.runOnUiThread {
            try {
                speechRecognizer?.cancel()
            } catch (e: Exception) {
                // ignore
            }
        }
    }

    @ReactMethod
    fun destroyRecognizer() {
        val activity = reactContext.currentActivity ?: return
        activity.runOnUiThread {
            speechRecognizer?.destroy()
            speechRecognizer = null
        }
    }

    @ReactMethod
    fun isAvailable(promise: Promise) {
        val available = SpeechRecognizer.isRecognitionAvailable(reactContext)
        promise.resolve(available)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    // RecognitionListener callbacks

    override fun onReadyForSpeech(params: Bundle?) {
        sendEvent("onSpeechStart", Arguments.createMap())
    }

    override fun onBeginningOfSpeech() {}

    override fun onRmsChanged(rmsdB: Float) {}

    override fun onBufferReceived(buffer: ByteArray?) {}

    override fun onEndOfSpeech() {
        sendEvent("onSpeechEnd", Arguments.createMap())
    }

    override fun onError(error: Int) {
        val errorMessage = when (error) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client side error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
            SpeechRecognizer.ERROR_NETWORK -> "Network error"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech match"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy"
            SpeechRecognizer.ERROR_SERVER -> "Server error"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
            else -> "Unknown error ($error)"
        }
        val params = Arguments.createMap().apply {
            putString("error", errorMessage)
            putInt("code", error)
        }
        sendEvent("onSpeechError", params)
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val params = Arguments.createMap().apply {
            val arr = Arguments.createArray()
            matches?.forEach { arr.pushString(it) }
            putArray("value", arr)
        }
        sendEvent("onSpeechResults", params)
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val params = Arguments.createMap().apply {
            val arr = Arguments.createArray()
            matches?.forEach { arr.pushString(it) }
            putArray("value", arr)
        }
        sendEvent("onSpeechPartialResults", params)
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}
}
