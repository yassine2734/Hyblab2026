import { getInterviewsList } from '@/lib/data/interviews'
import InterviewDetail from './InterviewDetail'

export function generateStaticParams() {
    return getInterviewsList().map(({ slug }) => ({ slug }))
}

export default function InterviewPage() {
    return <InterviewDetail />
}
