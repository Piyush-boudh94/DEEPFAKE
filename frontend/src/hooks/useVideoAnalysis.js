import { useCallback, useMemo, useRef, useState } from 'react'

import { detectDeepfake } from '../utils/api'


const INITIAL = {
	phase: 'idle',
	uploadProgress: 0,
	analysisProgress: 0,
	activeStep: 0,
	error: '',
}

const ANALYSIS_STEPS = [
	'Extracting Frames',
	'Running ResNet50 Feature Extraction',
	'LSTM Temporal Analysis',
	'Audio Analysis (YAMNet)',
	'Lip-Sync Verification',
	'Generating Report',
]


export function useVideoAnalysis() {
	const [state, setState] = useState(INITIAL)
	const [result, setResult] = useState(null)
	const [selectedFile, setSelectedFile] = useState(null)
	const timerRef = useRef(null)
	const abortRef = useRef(null)

	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const runProgressSimulation = useCallback(() => {
		stopTimer()
		timerRef.current = setInterval(() => {
			setState((prev) => {
				if (prev.analysisProgress >= 95) {
					return prev
				}
				const nextProgress = Math.min(prev.analysisProgress + Math.random() * 7, 95)
				const stepIndex = Math.min(
					ANALYSIS_STEPS.length - 1,
					Math.floor((nextProgress / 100) * ANALYSIS_STEPS.length),
				)
				return {
					...prev,
					analysisProgress: nextProgress,
					activeStep: stepIndex,
				}
			})
		}, 700)
	}, [stopTimer])

	const upload = useCallback(async (file) => {
		setSelectedFile(file)
		setResult(null)
		setState({
			phase: 'uploading',
			uploadProgress: 0,
			analysisProgress: 0,
			activeStep: 0,
			error: '',
		})

		const controller = new AbortController()
		abortRef.current = controller

		try {
			const response = await detectDeepfake(
				file,
				(event) => {
					const total = event.total || 1
					const progress = Math.round((event.loaded * 100) / total)
					setState((prev) => ({ ...prev, uploadProgress: progress }))
					if (progress > 20) {
						setState((prev) => ({ ...prev, phase: 'analyzing' }))
						runProgressSimulation()
					}
				},
				controller.signal,
			)

			stopTimer()
			setResult(response.data)
			setState({
				phase: 'complete',
				uploadProgress: 100,
				analysisProgress: 100,
				activeStep: ANALYSIS_STEPS.length - 1,
				error: '',
			})
			localStorage.setItem('satyanetra:last-result', JSON.stringify(response.data))
			return response.data
		} catch (error) {
			stopTimer()
			const message = error?.response?.data?.message || error?.message || 'Analysis failed.'
			setState((prev) => ({ ...prev, phase: 'error', error: message }))
			throw error
		}
	}, [runProgressSimulation, stopTimer])

	const cancel = useCallback(() => {
		if (abortRef.current) {
			abortRef.current.abort()
			abortRef.current = null
		}
		stopTimer()
		setState((prev) => ({ ...prev, phase: 'idle', uploadProgress: 0, analysisProgress: 0, activeStep: 0 }))
	}, [stopTimer])

	const reset = useCallback(() => {
		stopTimer()
		abortRef.current = null
		setResult(null)
		setSelectedFile(null)
		setState(INITIAL)
	}, [stopTimer])

	const steps = useMemo(
		() => ANALYSIS_STEPS.map((label, index) => ({ label, complete: index < state.activeStep, active: index === state.activeStep })),
		[state.activeStep],
	)

	return {
		state,
		result,
		selectedFile,
		steps,
		upload,
		cancel,
		reset,
	}
}

