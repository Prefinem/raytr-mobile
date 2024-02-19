import { addCategory, removeCategory, updateCategory } from '../../store/categories';
import { Category, RatingSchema } from '../../types';
import { RootState } from '../../store/configureStore';
import { TrashIcon } from 'react-native-heroicons/outline';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text } from 'react-native';
import Button from '../ui/Button';
import EditLayout from '../layout/EditLayout';
import IconButton from '../ui/IconButton';
import TextInput from '../ui/TextInput';
import uuid from '../../utils/uuid';

const getNewRatingSchema = (): RatingSchema => ({
  ratingSchemaId: uuid(),
  ratingSchemaName: '',
  ratingSchemaType: 'SLIDER',
  ratingSchemaWeight: 5,
});

const reducer = (state, { payload, type }: { payload?: any; type: string }) => {
  switch (type) {
    case 'SET':
      return { ...payload };
    case 'UPDATE':
      return { ...state, ...payload };
    case 'ADD_METRIC':
      return { ...state, ratingSchema: [...state.ratingSchema, getNewRatingSchema()] };
    case 'REMOVE_METRIC':
      return { ...state, ratingSchema: state.ratingSchema.filter(({ ratingSchemaId }) => ratingSchemaId !== payload) };
    case 'UPDATE_METRIC':
      const { ratingSchemaId, ...rest } = payload;

      return {
        ...state,
        ratingSchema: state.ratingSchema.map((ratingSchema) => ({
          ...ratingSchema,
          ...(ratingSchemaId === ratingSchema.ratingSchemaId ? rest : {}),
        })),
      };
    default:
      return state;
  }
};

type EditCategoryProps = {
  edit?: boolean;
  initialState: Category;
};

const EditCategory = ({ edit, initialState }: EditCategoryProps) => {
  const reduxDispatch = useDispatch();
  const [state, dispatch] = useReducer(reducer, {});
  const { categoryId } = useLocalSearchParams();
  const { categories } = useSelector((state: RootState) => state.categories);

  const category = useMemo(() => categories.find((category) => category.categoryId === categoryId), []);

  const updateValue = (key) => (value) => dispatch({ type: 'UPDATE', payload: { [key]: value } });
  const updateRatingSchema = (ratingSchemaId, key) => (value) =>
    dispatch({
      type: 'UPDATE_METRIC',
      payload: {
        ratingSchemaId,
        [key]: value,
      },
    });

  useEffect(() => {
    dispatch({ type: 'SET', payload: initialState });
  }, [category]);

  const addRatingMetric = useCallback(() => {
    dispatch({ type: 'ADD_METRIC' });
  }, []);

  const removeRatingMetric = useCallback((ratingSchemaId) => {
    dispatch({ type: 'REMOVE_METRIC', payload: ratingSchemaId });
  }, []);

  const saveCategory = useCallback(() => {
    if (edit) {
      reduxDispatch(updateCategory(state));
    } else {
      reduxDispatch(addCategory(state));
    }
    router.replace(`/category/${state.categoryId}`);
  }, [state]);

  const deleteCategory = useCallback(() => {
    reduxDispatch(removeCategory(state.categoryId));
    while (router.canGoBack()) {
      // Pop from stack until one element is left
      router.back();
    }
    router.replace(`/`);
  }, [state]);

  return (
    <EditLayout>
      <View className="flex flex-grow">
        <View className="flex">
          <View className="mb-4 flex border-b border-gray-900 pb-4">
            <Text className="text-2xl ">Add Category</Text>
          </View>
          <TextInput name="Category Name" onChange={updateValue('categoryName')} value={state.categoryName} />
          <TextInput
            multiline
            name="Category Description"
            onChange={updateValue('categoryDescription')}
            value={state.categoryDescription}
          />
          <View className="mt-2">
            <Text className="text-lg">Rating Metric</Text>
          </View>
          {(state.ratingSchema || []).map((ratingSchema) => (
            <View className="flex flex-row items-center space-y-2" key={ratingSchema.ratingSchemaId}>
              <TextInput
                classNames="mr-4"
                onChange={updateRatingSchema(ratingSchema.ratingSchemaId, 'ratingSchemaName')}
                value={ratingSchema.ratingSchemaName}
              />
              <IconButton onPress={() => removeRatingMetric(ratingSchema.ratingSchemaId)} Icon={TrashIcon} />
            </View>
          ))}
          <Button onPress={addRatingMetric} text="Add Rating Metric" />
        </View>
      </View>
      <View className="ios:mb-12 android:mb-4 mt-8 flex space-x-2">
        {edit ? (
          <Button onPress={saveCategory} text="Save Category" />
        ) : (
          <Button onPress={saveCategory} text="Add Category" />
        )}
        {edit ? <Button color="red" onPress={deleteCategory} text="Delete Category" /> : null}
      </View>
    </EditLayout>
  );
};

export default EditCategory;