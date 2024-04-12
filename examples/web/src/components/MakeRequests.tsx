import { useDispatch } from 'react-redux';
import { getPostsAction } from '../slices/postsSlice';

const MakeRequests = ({
  successCallback,
  errorCallback,
}: {
  successCallback: (result: any) => void;
  errorCallback: (error: any) => void;
}) => {
  const dispatch = useDispatch();

  const makeRequest = (action: any) => {
    const result = dispatch(action);
    console.log(result);
    if (!result.then) {
      // alert('Offline config returnPromises is false!');
      return result;
    }
    return result.then(successCallback).catch(errorCallback);
  };

  const onSucceedAlways = () => makeRequest(getPostsAction(0));
  const onSucceedSometimes = () => makeRequest(getPostsAction(1));
  const onFailSometimes = () => makeRequest(getPostsAction(2));

  return (
    <div>
      <button onClick={onSucceedAlways}>Succeed Always</button>
      <button onClick={onSucceedSometimes}>Succeed Sometimes</button>
      <button onClick={onFailSometimes}>Fail Sometimes</button>
    </div>
  );
};

export default MakeRequests;
