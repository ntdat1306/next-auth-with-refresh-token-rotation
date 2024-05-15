import { AxiosContext } from '@/context/AxiosProvider';
import { useContext } from 'react';

const useAxiosAuth = () => {
    const { axiosAuth } = useContext(AxiosContext);
    return axiosAuth;
};

export default useAxiosAuth;
