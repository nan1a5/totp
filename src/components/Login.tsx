import './components.css'
import { BsArrowRight } from 'react-icons/bs';

interface LoginProps {
    cb?: (username: string) => void;
}

const Login:React.FC<LoginProps> = ({
    cb
}) => {
    const handleClick = () => {
        const username = (document.querySelector('.login-view input') as HTMLInputElement).value||'nan1a5';
        cb && cb(username);
    }

    return (
        <div className='login-view'>
            <input type="text" name="" id="" placeholder='用户名' onKeyDown={
                // 回车键登录
                (e) => {
                    if(e.keyCode === 13) {
                        const username = (document.querySelector('.login-view input') as HTMLInputElement).value||'nan1a5';
                        cb && cb(username);
                    }
                }
            } />
            <button className='button_login' onClick={handleClick}>
                <BsArrowRight
                    style={{
                        fontSize: '25px',
                        fontWeight: 'bold',
                        color: '#fff',
                    }}
                />
            </button>
        </div>
    )
}

export default Login;