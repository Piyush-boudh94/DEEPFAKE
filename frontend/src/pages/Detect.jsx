import { useMemo } from 'react'
import toast from 'react-hot-toast'

import AnalysisProgress from '../components/AnalysisProgress'
import Chatbot from '../components/Chatbot'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import ResultCard from '../components/ResultCard'
import VideoUploader from '../components/VideoUploader'
import { useVideoAnalysis } from '../hooks/useVideoAnalysis'
import { downloadReport } from '../utils/api'


function Detect() {
	const { state, result, selectedFile, steps, upload, cancel } = useVideoAnalysis()

	const progressVisible = useMemo(
		() => state.phase === 'uploading' || state.phase === 'analyzing',
		[state.phase],
	)

	const onAnalyze = async (file) => {
		try {
			await upload(file)
			toast.success('Analysis completed.')
		} catch (error) {
			const rawMessage =
				error?.response?.data?.message ||
				error?.response?.data?.details ||
				error?.message ||
				'Analysis failed. Please try another file.'
			const message =
				rawMessage === 'Network Error'
					? 'Local server is unreachable. Start the app with start_satyanetra_prod.bat and open http://localhost:5050.'
					: rawMessage
			toast.error(message)
		}
	}

	const onDownloadReport = async () => {
		if (!result) return
		try {
			const response = await downloadReport(result)
			const blob = new Blob([response.data], { type: 'application/pdf' })
			const url = window.URL.createObjectURL(blob)
			const anchor = document.createElement('a')
			anchor.href = url
			anchor.download = `satyanetra_report_${Date.now()}.pdf`
			anchor.click()
			window.URL.revokeObjectURL(url)
			toast.success('Report downloaded.')
		} catch {
			toast.error('Failed to download report.')
		}
	}

	return (
		<div>
			<Navbar />
			<main className="mx-auto max-w-6xl px-6 pb-10 pt-32">
				<h1 className="text-4xl font-bold text-white">Deepfake Detection Studio</h1>
				<p className="mt-2 text-slate-300">Upload a video to run visual, audio, and lip-sync consistency checks.</p>

				<div className="mt-8">
					<VideoUploader state={state} selectedFile={selectedFile} onAnalyze={onAnalyze} onCancel={cancel} />
					<AnalysisProgress
						visible={progressVisible}
						progress={state.analysisProgress}
						steps={steps}
					/>
					<ResultCard
						result={result}
						onDownloadReport={onDownloadReport}
						onAskAi={() => toast('Open the chatbot at the bottom-right corner.')}
					/>
				</div>
			</main>
			<Footer />
			<Chatbot />
		</div>
	)
}

export default Detect

