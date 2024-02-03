import { addCategory } from '../../store/categories';
import { Category, RatingSchema } from '../../types';
import { router } from 'expo-router';
import { useCallback, useEffect, useReducer } from 'react';
import { useDispatch } from 'react-redux';
import { View, Text, ScrollView } from 'react-native';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import uuid from '../../utils/uuid';

const getNewCategory = (): Category => ({
  categoryId: uuid(),
  categoryName: '',
  categoryDescription: '',
  ratingSchema: [],
});

const getNewRatingSchema = (): RatingSchema => ({
  ratingSchemaId: uuid(),
  ratingSchemaName: '',
  ratingSchemaType: 'SLIDER',
  ratingSchemaWeight: 5,
});

const reducer = (state, { payload, type }: { payload?: any; type: string }) => {
  switch (type) {
    case 'RESET':
      return { ...getNewCategory() };
    case 'UPDATE':
      return { ...state, ...payload };
    case 'ADD_METRIC':
      return { ...state, ratingSchema: [...state.ratingSchema, getNewRatingSchema()] };
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

const AddCategory = () => {
  const reduxDispatch = useDispatch();
  const [state, dispatch] = useReducer(reducer, {});

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
    dispatch({ type: 'RESET' });
  }, []);

  const addRatingMetric = useCallback(() => {
    dispatch({ type: 'ADD_METRIC' });
  }, []);

  const saveCategory = useCallback(() => {
    reduxDispatch(addCategory(state));
    router.replace(`/category/${state.categoryId}`);
  }, [state]);

  return (
    <View className="flex h-full p-2">
      <ScrollView className="flex flex-grow">
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
          <View key={ratingSchema.ratingSchemaId}>
            <TextInput
              onChange={updateRatingSchema(ratingSchema.ratingSchemaId, 'ratingSchemaName')}
              value={ratingSchema.ratingSchemaName}
            />
          </View>
        ))}
        <Button onPress={addRatingMetric} text="Add Rating Metric" />
      </ScrollView>
      <View className="ios:mb-12 android:mb-4 flex">
        <Button onPress={saveCategory} text="Add Category" />
      </View>
    </View>
  );
};

export default AddCategory;
