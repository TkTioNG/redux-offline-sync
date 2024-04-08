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

  const makeRequest = (actionCaller: any) => {
    const result = dispatch(actionCaller());
    console.log(result);
    if (!result.then) {
      alert('Offline config returnPromises is false!');
      return result;
    }
    return result.then(successCallback).catch(errorCallback);
  };

  const onSucceedAlways = () => makeRequest(getPostsAction);
  const onSucceedSometimes = () => makeRequest(getPostsAction);
  const onFailSometimes = () => makeRequest(getPostsAction);

  return (
    <div>
      <button onClick={onSucceedAlways}>Succeed Always</button>
      <button onClick={onSucceedSometimes}>Succeed Sometimes</button>
      <button onClick={onFailSometimes}>Fail Sometimes</button>
    </div>
  );
};

export default MakeRequests;
