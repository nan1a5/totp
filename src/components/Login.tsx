import toast from 'react-hot-toast';
import './components.css'
import { BsArrowRight, BsChevronRight } from 'react-icons/bs';
import { useRef, useState } from 'react';
import { MdRotateRight } from 'react-icons/md';
import { debounce, throttle } from '../utils/utils';

interface LoginProps {
    cb?: (username: string, cb?: Function) => void;
}

const Login:React.FC<LoginProps> = ({
    cb
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: any) => {
        e?.preventDefault();
        setIsLoading(true);
        const username = inputRef.current?.value||'';

        if(!username) {
            toast('请输入用户名',{
                duration: 600,
                style: {
                    borderRadius: '10px',
                    color: '#FF0033',
                },
            })
            setIsLoading(false);
            return;
        } 
        toast(`等待加载...`, {
            duration: 1000,
            style: {
                borderRadius: '10px',
                color: '#0099CC',
            },
        });

        cb && cb(username, () => {
            setIsLoading(false);
            toast(`欢迎登录,${username}`, {
                icon: '👋',
                style: {
                  borderRadius: '10px',
                  color: '#0099CC',
                },
            });
        });
        inputRef.current!.value = '';
        // setIsLoading(false);
    }

    // const debouncesubmit = (e: any) => {
    //     e.preventDefault();
        
    //     debounce(handleSubmit, 1000)(e);
    // }

    return (
        <form onSubmit={handleSubmit} className='login-view'>
            <div>
                <input ref={inputRef} type="text" name="" id="" placeholder={isLoading?"加载中...":'"用户名"'} disabled={isLoading} />
                <button className={`button_login ${isLoading && 'disabled'}`} disabled={isLoading}>
                    {
                        isLoading ? <MdRotateRight className='icon-loading' /> : <BsChevronRight />
                    }
                </button>
            </div>
        </form>
    )
}

export default Login;