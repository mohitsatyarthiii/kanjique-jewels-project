import React from 'react'
import Hero from '../components/homepage/Hero'
import BlackMarquee from '../components/homepage/BlackStripSlider'
import Categories from '../components/homepage/Categories'
import TabbedProducts from '../components/homepage/TabbedProducts'
import FeaturedProducts from '../components/homepage/FeaturedProducts'
import GiftGuideSection from '../components/homepage/GiftGuideSection'
import WomensCollectionSection from '../components/homepage/WomensCollectionSection'
import BrandAndFaqContent from '../components/homepage/BrandContent'
import MessageSection from '../components/homepage/MessageSection'

const Homepage = () => {
  return (
    <div>
        <Hero/>
        <BlackMarquee/>
        <WomensCollectionSection/>
        <Categories/>
        <TabbedProducts/>
        <GiftGuideSection/>
       
        <FeaturedProducts/>
        <MessageSection/>
        
        <BrandAndFaqContent/>
    </div>
  )
}

export default Homepage