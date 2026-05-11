import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { ToastContainer } from './toast';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

function App() {
    useKeyboardShortcuts();
    
    return (
        <div className="app-wrapper">
            <PipelineToolbar />
            <PipelineUI />
            <SubmitButton />
            {/* ToastContainer must be at root level so it renders above everything */}
            <ToastContainer />
        </div>
    );
}

export default App;