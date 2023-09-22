import { SUPPORTED_MODELS } from "../../../../Constants";
import "./ChatChooseModelMenu.css"

interface ChatChooseModelMenuProps {
    availableModels?: [{ name: string, via_system_key: boolean }]
    onChooseModel: (name: string | undefined, is_via_system: boolean) => void
    disableAllModels: boolean
}

export function ChatChooseModelMenu(props: ChatChooseModelMenuProps) {
    function shouldDisableModel(modelName: string) {
        if (props.disableAllModels) {
            return true
        }
        if (props.availableModels == undefined) {
            return false;
        }
        return !props.availableModels?.filter((model) => model.via_system_key == false).find((model) => model.name == modelName)
    }
    return <div>
            {/* disable a list of supported models. enable ones according to the backend. */}
            {SUPPORTED_MODELS.map((modelName) => {
                return <button disabled={shouldDisableModel(modelName)} onClick={() => props.onChooseModel(modelName, false)}>
                    {modelName}
                </button>
            })}
            {/* only show trial models if backend returns them */}
            {(props.availableModels ?? []).filter((model) => model.via_system_key == true).map((model) => {
                return <button onClick={() => props.onChooseModel(model.name, true)}>
                    <span className="trial-tag">Trial</span>{model.name}
                </button>
            })}
        </div>

};
export default ChatChooseModelMenu;