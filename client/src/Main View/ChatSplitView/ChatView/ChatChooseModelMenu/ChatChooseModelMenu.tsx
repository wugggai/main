import { SUPPORTED_MODELS } from "../../../../Constants";
import { AI, ModelAndKey } from '../../../../Interfaces';
import "./ChatChooseModelMenu.css"

interface ChatChooseModelMenuProps {
    availableModels?: ModelAndKey[]
    onChooseModel: (moedlAndKey: ModelAndKey) => void
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
        return !props.availableModels?.filter((modelAndKey) => modelAndKey.via_system_key == false).find((modelAndKey) => modelAndKey.name == modelName)
    }
    return <div>
            {/* disable a list of supported models. enable ones according to the backend. */}
            {SUPPORTED_MODELS.map((modelName) => {
                return <button className='model-button' disabled={shouldDisableModel(modelName)} onClick={() => props.onChooseModel({name: modelName as AI, via_system_key: false})}>
                    <span className="model-tag user-api-key-tag">API</span>{modelName}
                </button>
            })}
            {/* only show trial models if backend returns them */}
            {(props.availableModels ?? []).filter((modelAndKey) => modelAndKey.via_system_key == true).map((modelAndKey) => {
                return <button className='model-button' onClick={() => props.onChooseModel(modelAndKey)}>
                    <span className="model-tag system-api-key-tag">YUSE</span>{modelAndKey.name}
                </button>
            })}
        </div>

};
export default ChatChooseModelMenu;